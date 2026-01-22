self.onmessage = function(e) {
    const { rawData } = e.data;
    // Procesamiento pesado fuera del hilo principal
    const processed = rawData.map(item => ({
        ...item,
        promedio: Math.round(item.promedio)
    }));
    self.postMessage(processed);
};
