export default function AdminDashboard() {
  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-8">
        Admin Dashboard
      </h1>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="font-bold text-xl">
            Total Users
          </h2>

          <p className="text-4xl mt-4">124</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="font-bold text-xl">
            Total Tours
          </h2>

          <p className="text-4xl mt-4">80</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="font-bold text-xl">
            Total Bookings
          </h2>

          <p className="text-4xl mt-4">500</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="font-bold text-xl">
            Revenue
          </h2>

          <p className="text-4xl mt-4">$12K</p>
        </div>
      </div>
    </div>
  );
}