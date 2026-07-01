const CLAIM_OPTIONS = [
  { id: "earlyFive", label: "Early Five" },
  { id: "topLine", label: "Top Line" },
  { id: "middleLine", label: "Middle Line" },
  { id: "bottomLine", label: "Bottom Line" },
  { id: "fullHouse", label: "Full House" },
];

export default function TambolaTicket({ grid, calledNumbers = [], showMarked = true }) {
  const called = new Set(calledNumbers);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[480px]">
        <tbody>
          {grid.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => {
                const isNumber = cell !== null && cell !== undefined;
                const isCalled = isNumber && called.has(cell);

                return (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    className={`border-2 border-purple-300 p-3 text-center font-bold text-lg h-14 ${
                      isNumber
                        ? showMarked && isCalled
                          ? "bg-green-500 text-white"
                          : "bg-white text-purple-900"
                        : "bg-purple-50"
                    }`}
                  >
                    {isNumber ? cell : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { CLAIM_OPTIONS };
