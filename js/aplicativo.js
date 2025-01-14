if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    speakText("Tu navegador no soporta la API de reconocimiento de voz.");
} else {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    const recipientRecognition = new SpeechRecognition();

    recognition.lang = 'es-ES';
    recognition.interimResults = true;
    recognition.continuous = true;

    recipientRecognition.lang = 'es-ES';
    recipientRecognition.interimResults = true;

    const recipientInput = document.getElementById('recipient');
    const output = document.getElementById('output');
    const recipientImages = document.querySelectorAll('.small-image');
    const fontBoxes = document.querySelectorAll('.font-box');
    const backgroundBoxes = document.querySelectorAll('.background-box');
    const colorPicker = document.getElementById('color-picker');

    let isPaused = false;
    let finalTranscript = '';
    let selectedFont = 'Times New Roman';
    let selectedPreviewBackground = '';
	let selectedColor = 'white';

    document.addEventListener('DOMContentLoaded', () => {
        speakText("¡Bienvenido a la Carta Mágica! Elige un destinatario en una de las imágenes y comienza a escribir tu carta.");
    });

    // Función para hablar texto
    function speakText(text) {
        const speech = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();

        // Buscar y seleccionar la voz
        const selectedVoice = voices.find(voice => voice.name === "Microsoft Laura - Spanish (Spain)");
        speech.lang = 'es-MX'; // Configurar el idioma correspondiente
        window.speechSynthesis.speak(speech);
    } 

    recognition.onerror = (event) => {
        speakText(`Ocurrió un error: ${event.error}. Por favor, verifica los permisos de micrófono.`);
    };

    recipientImages.forEach((image) => {
        image.addEventListener('click', () => {
            const recipientName = image.getAttribute('data-recipient');
            if (recipientName) {
                recipientInput.value = recipientName;
                speakText(`Has seleccionado a ${recipientName} como destinatario.`);
            } else {
                speakText("No se pudo identificar al destinatario.");
            }
        });
    });

	fontBoxes.forEach((box) => {
        box.addEventListener('click', () => {
            selectedFont = box.getAttribute('data-font');
            output.style.fontFamily = selectedFont;
            speakText(`Tipografía cambiada a ${selectedFont}`);
        });
    });

    backgroundBoxes.forEach((box) => {
        box.addEventListener('click', () => {
            selectedColor = box.getAttribute('data-color');
        output.style.backgroundColor = selectedColor;
        });
    });

    colorPicker.addEventListener('input', () => {
        const selectedColor = colorPicker.value;
        output.style.backgroundColor = selectedColor;
        speakText(`Fondo cambiado a color ${selectedColor}`);
    });
	
	
	const helpButton = document.getElementById('help-btn');
	helpButton.addEventListener('click', () => {
		speakText('Elige un destinatario en una de las imágenes y comienza a escribir tu carta.');
	});
	
	// Botón Hablar
	const startButton = document.getElementById('start-btn');
	const stopButton = document.getElementById('stop-btn');
	const resetButton = document.getElementById('reset-text-btn');
	const listenButton = document.getElementById('listen-text-btn');
	const exportPdfButton = document.getElementById('export-pdf-btn');

	
	startButton.addEventListener('click', () => {
		recognition.start();
		isPaused = false;
		speakText('El dictado ha comenzado.');
		startButton.disabled = true;
		stopButton.disabled = false;

		recognition.onresult = (event) => {
			let interimTranscript = '';
			for (let i = event.resultIndex; i < event.results.length; i++) {
				if (event.results[i].isFinal) {
					finalTranscript += event.results[i][0].transcript;
				} else {
					interimTranscript += event.results[i][0].transcript;
				}
			}
			output.value = finalTranscript + ' ' + interimTranscript;
		};
	});

	// Botón Pausar
	stopButton.addEventListener('click', () => {
		recognition.stop();
		isPaused = true;
		speakText('El dictado se ha pausado.');
		startButton.disabled = false;
		stopButton.disabled = true;
	});

	// Botón Reiniciar
	resetButton.addEventListener('click', () => {
		finalTranscript = '';
		output.value = '';
		speakText('El texto ha sido reiniciado.');
	});

	// Botón Escuchar
	listenButton.addEventListener('click', () => {
		const textToRead = output.value;
		speakText(textToRead);
	});

	// Botón Exportar a PDF con fondo y tipografía personalizada
	exportPdfButton.addEventListener('click', async () => {
		const text = output.value.trim();
		const recipient = recipientInput.value.trim();
		const date = new Date().toLocaleDateString();

		if (!recipient || !text) {
			speakText('Por favor, completa todos los campos antes de exportar.');
			return;
		}

		const { jsPDF } = window.jspdf;
		const pdf = new jsPDF();
		pdf.setFont(selectedFont);

		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();

		if (selectedPreviewBackground) {
			const img = new Image();
			img.src = "../img/fondopdf.jpeg";

			img.onload = () => {
				pdf.addImage(img, 'JPEG', 0, 0, pageWidth, pageHeight);
				pdf.setTextColor(0, 0, 0);
				pdf.text(`Para: ${recipient}`, 10, 20);
				pdf.text(`Fecha: ${date}`, 10, 30);
				pdf.text(text, 10, 50);
				pdf.save('mi_primera_carta_web.pdf');
			};

			img.onerror = () => {
				console.error('Error al cargar la imagen de fondo.');
				speakText('No se pudo cargar la imagen de fondo. Intenta nuevamente.');
			};
		} else {
			pdf.text(`Para: ${recipient}`, 10, 20);
			pdf.text(`Fecha: ${date}`, 10, 30);
			pdf.text(text, 10, 50);
			pdf.save('mi_primera_carta_web.pdf');
		}
	});

	

    recognition.onresult = (event) => {
        if (isPaused) return;

        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        output.value = finalTranscript.trim();
        if (interimTranscript) {
            output.value += ` ${interimTranscript}`;
        }
    };

    recipientInput.addEventListener('input', () => {
        const recipient = recipientInput.value.trim() || '[Destinatario]';
        const date = new Date().toLocaleDateString();
        const text = output.value.trim() || 'Escribe tu carta aquí...';

        document.getElementById('preview-recipient-name').textContent = recipient;
        document.getElementById('preview-date').textContent = `Fecha: ${date}`;
        document.getElementById('preview-text').textContent = text;
    });

    output.addEventListener('input', () => {
        const recipient = recipientInput.value.trim() || '[Destinatario]';
        const date = new Date().toLocaleDateString();
        const text = output.value.trim() || 'Escribe tu carta aquí...';

        document.getElementById('preview-recipient-name').textContent = recipient;
        document.getElementById('preview-date').textContent = `Fecha: ${date}`;
        document.getElementById('preview-text').textContent = text;
    });

} 
