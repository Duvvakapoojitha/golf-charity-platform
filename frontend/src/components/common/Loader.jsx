export default function Loader({ fullScreen = false }) {
  const inner = (
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-gray-700 border-t-primary-500 rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-50">
        {inner}
      </div>
    )
  }

  return <div className="flex items-center justify-center py-16">{inner}</div>
}
