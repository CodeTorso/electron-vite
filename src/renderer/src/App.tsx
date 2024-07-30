function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <div className="w-full h-screen bg-[#00000085] rounded-3xl flex justify-center items-center">
      <h1 className="text-3xl font-bold underline text-white">hello there!</h1>
    </div>
  )
}

export default App
