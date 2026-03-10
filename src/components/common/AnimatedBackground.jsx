function AnimatedBackground() {
  return (
    <div className="fixed inset-0 md:ml-64 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-primary/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-tr from-orange-600/20 to-orange-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>
  );
}

export default AnimatedBackground;
