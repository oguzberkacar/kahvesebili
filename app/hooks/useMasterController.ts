"use client";

  // Track connected stations
  const [activeStations, setActiveStations] = useState<Set<string>>(new Set());

  // ... (useMqttClient call remains same) ...

  // Handle Incoming Messages
  // ... (useEffect remains same)

  const handleMessage = useCallback(
    (msg: IncomingMessage) => {
      try {
        const payload: any = msg.json || JSON.parse(msg.payload);

        // 1. Station Hello -> Send Config
        // Topic structure: station/{id}/hello
        if (msg.topic.endsWith("/hello")) {
          const stationId = payload.deviceId;
          if (!stationId) return;

          console.log("Master received hello from:", stationId);
          
          // Mark as active
          setActiveStations((prev) => {
             const next = new Set(prev);
             next.add(stationId);
             return next;
          });

          // ... (rest of logic: find coffee, publish config) ...
          
          let coffee = null;
          // Try parsing number
          const numericId = parseInt(stationId.replace("station", ""), 10);
          console.log("Parsed numeric ID:", numericId);

          if (!isNaN(numericId)) {
            coffee = coffees.find((c) => c.stationId === numericId);
          } else {
            // Fallback or exact match if string IDs used later
            coffee = coffees.find((c) => String(c.stationId) === stationId);
          }

          if (coffee) {
            console.log(`Configuring ${stationId} with ${coffee.name}`);
            // Send Config
            const topic = mqttTopics.station(stationId).command; 
            publish({
              topic,
              payload: {
                type: "set_config",
                deviceId: stationId,
                coffee: coffee,
                ts: Date.now(),
              },
            });
          } else {
            console.warn("No coffee found for stationId:", stationId);
          }
        }
        
        // ... (rest of Start Request logic) ...
         if (payload.type === "start_request") {
          // ... 
         }

      } catch (e) {
        console.error("Master Handle Error", e);
      }
    },
    [publish]
  );
  
  // Public Actions
  const sendOrder = useCallback(
    (stationId: string, orderDetails: any) => {
      // orderDetails: { orderId, size, recipeId... }
      const topic = mqttTopics.station(stationId).command;
      publish({
        topic,
        payload: {
          ...orderDetails,
          deviceId: stationId,
          ts: Date.now(),
        },
      });
    },
    [publish]
  );

  return {
    connectionState,
    sendOrder,
    activeStations: Array.from(activeStations), // Return as Array for easier consumption
  };
}
