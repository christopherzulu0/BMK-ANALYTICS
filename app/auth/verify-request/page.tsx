export default function VerifyRequest() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8 text-center">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Check your email
        </h2>
        <div className="mt-2">
          <p className="text-gray-600">
            A sign in link has been sent to your email address.
          </p>
          <p className="text-gray-600 mt-2">
            Please check your email (including spam folder) and click the link to sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
