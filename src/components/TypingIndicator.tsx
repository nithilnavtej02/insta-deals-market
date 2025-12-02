export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg max-w-xs">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-xs text-muted-foreground">typing...</span>
    </div>
  );
};
