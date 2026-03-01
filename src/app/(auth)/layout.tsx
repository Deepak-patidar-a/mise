import React from 'react'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-1 items-center justify-center py-12">
      {children}
    </div>
  )
}

export default AuthLayout