-- Ensure avatars storage bucket and policies
insert into storage.buckets (id, name, public)
values ('avatars','avatars', true)
on conflict (id) do nothing;

-- Enable RLS on storage.objects (already enabled by default)
-- Policies for avatars bucket
drop policy if exists "Public can view avatars" on storage.objects;
create policy "Public can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Favorites table for likes
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
alter table public.favorites enable row level security;

drop policy if exists "Users can view own favorites" on public.favorites;
create policy "Users can view own favorites"
  on public.favorites for select
  using (auth.uid() = (select user_id from public.profiles p where p.id = favorites.user_id));

drop policy if exists "Users can add to favorites" on public.favorites;
create policy "Users can add to favorites"
  on public.favorites for insert
  to authenticated
  with check (auth.uid() = (select user_id from public.profiles p where p.id = favorites.user_id));

drop policy if exists "Users can remove from favorites" on public.favorites;
create policy "Users can remove from favorites"
  on public.favorites for delete
  using (auth.uid() = (select user_id from public.profiles p where p.id = favorites.user_id));

-- Conversations and messages for chat
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_1 uuid not null references public.profiles(id) on delete cascade,
  participant_2 uuid not null references public.profiles(id) on delete cascade,
  last_message_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Update timestamps trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_conversations_updated_at on public.conversations;
create trigger update_conversations_updated_at
before update on public.conversations
for each row execute function public.update_updated_at_column();

-- RLS policies for conversations
drop policy if exists "Users can view their conversations" on public.conversations;
create policy "Users can view their conversations"
  on public.conversations for select
  using (
    auth.uid() = (select user_id from public.profiles p where p.id = participant_1) or
    auth.uid() = (select user_id from public.profiles p where p.id = participant_2)
  );

drop policy if exists "Users can create conversation they participate in" on public.conversations;
create policy "Users can create conversation they participate in"
  on public.conversations for insert
  to authenticated
  with check (
    auth.uid() = (select user_id from public.profiles p where p.id = participant_1) or
    auth.uid() = (select user_id from public.profiles p where p.id = participant_2)
  );

-- RLS policies for messages
drop policy if exists "Users can view messages in their conversations" on public.messages;
create policy "Users can view messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (
          auth.uid() = (select user_id from public.profiles p1 where p1.id = c.participant_1) or
          auth.uid() = (select user_id from public.profiles p2 where p2.id = c.participant_2)
        )
    )
  );

drop policy if exists "Users can send messages to their conversations" on public.messages;
create policy "Users can send messages to their conversations"
  on public.messages for insert
  to authenticated
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and messages.sender_id in (c.participant_1, c.participant_2)
        and auth.uid() = (select user_id from public.profiles p where p.id = messages.sender_id)
    )
  );

-- Realtime support
alter table public.messages replica identity full;
alter table public.conversations replica identity full;
