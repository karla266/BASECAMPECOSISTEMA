export default function Home() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000', margin: 0, padding: 0 }}>
      {/* Video inmersivo a pantalla completa sin distracciones */}
      <iframe 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100vw',
          height: '56.25vw', /* Proporción exacta 16:9 */
          minHeight: '100vh',
          minWidth: '177.77vh',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none', /* Evita que el usuario pause el video por error */
          border: 'none'
        }}
        src="https://www.youtube.com/embed/cqxPXm6j_Cs?autoplay=1&mute=1&loop=1&playlist=cqxPXm6j_Cs&controls=0&showinfo=0&modestbranding=1" 
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
