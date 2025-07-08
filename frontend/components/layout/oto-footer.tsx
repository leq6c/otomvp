export default function OtoFooter() {
  const users = ["John", "Chris", "Anna", "Mike", "Sarah"]
  
  const getUserId = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userId") || "default-user";
    }
    return "default-user";
  }

  return (
    <footer className="w-full py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-neutral-600">
          {/*
          <span className="font-semibold">Users:</span> {users.join(", ")}
          */}
        </p>
      </div>
    </footer>
  )
}
