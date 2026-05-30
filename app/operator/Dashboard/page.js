export default function OperatorDashboard() {
  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-8">
        Operator Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold">Total Tours</h2>
          <p className="text-5xl mt-4">12</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold">Bookings</h2>
          <p className="text-5xl mt-4">52</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold">Revenue</h2>
          <p className="text-5xl mt-4">$2500</p>
        </div>
      </div>
    </div>
  );
}