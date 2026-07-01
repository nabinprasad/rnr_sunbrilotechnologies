import { createContext, useContext, useState } from "react";

const EventContext = createContext();

export function EventProvider({ children }) {
  const [currentEvent, setCurrentEvent] = useState("lobby");

  return (
    <EventContext.Provider
      value={{
        currentEvent,
        setCurrentEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  return useContext(EventContext);
}