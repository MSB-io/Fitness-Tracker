import { Outlet } from "react-router-dom"

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">FitTrack</h1>
          <p className="text-muted mt-2">Your personal fitness companion</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
