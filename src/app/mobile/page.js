export default function Bloqueado() {
  return (
    <div className="flex items-center justify-center h-screen bg-background text-foreground">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Mobile em desenvolvimento</h1>
        <p className="text-muted-foreground">
          Nosso serviço está disponível apenas em computadores.
        </p>
      </div>
    </div>
  );
}
