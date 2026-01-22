self.onmessage = function(e) {
    const { type, data } = e.data;
    
    // El Worker procesa la data pesada en un hilo separado del UI
    if (type === 'PROCESS_CHARTS') {
        const sorted = data.sort((a, b) => b.cantidad - a.cantidad);
        self.postMessage({ type: 'SUCCESS', payload: sorted });
    }
};
