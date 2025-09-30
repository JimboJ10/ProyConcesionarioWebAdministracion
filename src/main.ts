import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md">
      <h1 class="text-3xl font-bold text-blue-600 mb-4">¡Hola con Tailwind!</h1>
      <p class="text-gray-700">Tu proyecto está configurado con Tailwind CSS</p>
      <button class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Botón de prueba
      </button>
    </div>
  </div>
`;
