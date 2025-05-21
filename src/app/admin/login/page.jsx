import AdminLoginForm from "@/components/admin-login-form";
import Link from "next/link";
import Image from "next/image";

export default function AdminLoginPage() {
  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
      <div className="row w-100 h-100 d-flex align-items-center justify-content-center">
        <div className="col-12 col-md-6 col-lg-5 col-xl-4 d-flex flex-column justify-content-center p-4 p-sm-5">
          <div className="mb-5">
            <div className="d-flex justify-content-center mb-4">
              <Link href="/" className="d-inline-block">
                <Image
                  src="/logo-new.png"
                  alt="Tyakkai Social Logo"
                  width={180}
                  height={50}
                  priority
                />
              </Link>
            </div>
            <div className="badge bg-purple text-white px-3 fs-6 mb-3">
              Admin Portal
            </div>
            <h1 className="h3 mb-1 text-center">Admin Login</h1>
            <p className="text-muted text-center">Access the administrator dashboard</p>
          </div>

          <AdminLoginForm />

          <div className="mt-4 text-center">
            <Link href="/" className="text-decoration-none">
              ← Return to user login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
