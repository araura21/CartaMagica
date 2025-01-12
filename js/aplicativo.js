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

    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const soundBtn = document.getElementById('sound-btn');
    const recipientInput = document.getElementById('recipient');
    const output = document.getElementById('output');
    const recordRecipientBtn = document.getElementById('record-recipient-btn');
    const listenRecipientBtn = document.getElementById('listen-recipient-btn');
    const resetRecipientBtn = document.getElementById('reset-recipient-btn');
    const listenTextBtn = document.getElementById('listen-text-btn');
    const resetTextBtn = document.getElementById('reset-text-btn');

    let isPaused = false; // Estado de pausa
    
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


    // Ayuda al iniciar
    soundBtn.addEventListener('click', () => {
        speakText("Puedes escribir una carta aquí. Primero elige el destinatario y luego dicta tu carta.");
    });
    

    recognition.onerror = (event) => {
        speakText(`Ocurrió un error: ${event.error}. Por favor, verifica los permisos de micrófono.`);
    };

    console.log("Iniciando reconocimiento de voz...");

    // Grabar destinatario
    recordRecipientBtn.addEventListener('click', () => {
        recipientRecognition.start();
    });

    // Escuchar destinatario
    listenRecipientBtn.addEventListener('click', () => {
        speakText(recipientInput.value);
    });

    // Reiniciar destinatario
    resetRecipientBtn.addEventListener('click', () => {
        recipientInput.value = '';
        window.speechSynthesis.cancel(); // Cancelar cualquier reproducción activa
    });

    recipientRecognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        recipientInput.value = transcript;
    };

    // Grabar carta
    startBtn.addEventListener('click', () => {
        isPaused = false; // Reiniciar pausa
        recognition.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
    });

    // Detener grabación
stopBtn.addEventListener('click', () => {
recognition.stop();
startBtn.disabled = false;
stopBtn.disabled = true;
});


let finalTranscript = ''; // Texto final acumulado

recognition.onresult = (event) => {
    if (isPaused) return; // Ignorar resultados si está en pausa

    let interimTranscript = ''; // Texto intermedio

    for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
            // Acumular texto final evitando duplicación
            finalTranscript += event.results[i][0].transcript;
        } else {
            // Acumular texto intermedio
            interimTranscript += event.results[i][0].transcript;
        }
    }

    // Actualizar el contenido del textarea
    output.value = finalTranscript.trim(); // Mostrar solo texto final
    if (interimTranscript) {
        output.value += ` ${interimTranscript}`; // Añadir texto intermedio temporalmente
    }
};



    recognition.onend = () => {
        startBtn.disabled = false;
        stopBtn.disabled = true;
        stopBtn.textContent = 'Pausar';
    };

    // Escuchar carta
    listenTextBtn.addEventListener('click', () => {
        speakText(output.value);
    });

    // Reiniciar carta
    resetTextBtn.addEventListener('click', () => {
        output.value = '';
    });

    // Seleccionar destinatario desde las imágenes
    const recipientImages = document.querySelectorAll('.small-image');
    recipientImages.forEach((image) => {
        image.addEventListener('click', () => {
            const recipientName = image.getAttribute('data-recipient');
            if (recipientName) {
                recipientInput.value = recipientName;
                speakText(`Has seleccionado a ${recipientName} `);
            } else {
                speakText("No se pudo identificar al destinatario.");
            }
        });
    });

    // Exportar PDF
    // Variables para almacenar el fondo y la tipografía seleccionada
let selectedPreviewBackground = '';
let selectedFont = 'Times New Roman';  // Fuente predeterminada

// Actualizar la previsualización del fondo
function updatePreviewBackground() {
    const previewArea = document.getElementById('preview-area');
    if (selectedPreviewBackground) {
        previewArea.style.backgroundImage = `url(${selectedPreviewBackground})`; // Establecer el fondo de la previsualización
    } else {
        previewArea.style.backgroundImage = ''; // Si no se ha seleccionado fondo, mantener fondo blanco
    }
}

// Opción para elegir el fondo 1
document.getElementById('background1-btn').addEventListener('click', () => {
    selectedPreviewBackground = '../img/fondopdf.jpeg'; // Ruta de la imagen de fondo 1
    updatePreviewBackground(); // Actualizar previsualización
    speakText('Has seleccionado el Fondo 1.');
});

// Opción para elegir el fondo 2
document.getElementById('background2-btn').addEventListener('click', () => {
    selectedPreviewBackground = '../img/fondopdf2.png'; // Ruta de la imagen de fondo 2
    updatePreviewBackground(); // Actualizar previsualización
    speakText('Has seleccionado el Fondo 2.');
});

// Opción para elegir el fondo desde un archivo
document.getElementById('background-file').addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        selectedPreviewBackground = e.target.result;
        updatePreviewBackground(); // Actualizar previsualización
    };
    reader.readAsDataURL(file);
});

// Función para actualizar el texto de la carta en la previsualización
function updatePreviewText() {
    const recipient = document.getElementById('recipient').value.trim() || '[Destinatario]';
    const date = new Date().toLocaleDateString();
    const text = document.getElementById('output').value.trim() || 'Escribe tu carta aquí...';

    document.getElementById('preview-recipient-name').textContent = recipient;
    document.getElementById('preview-date').textContent = `Fecha: ${date}`;
    document.getElementById('preview-text').textContent = text;

    // Actualizar la fuente de la previsualización
    document.getElementById('preview-area').style.fontFamily = selectedFont;
}       

// Actualizar previsualización cada vez que se cambia el destinatario o el texto
document.getElementById('recipient').addEventListener('input', updatePreviewText);
document.getElementById('output').addEventListener('input', updatePreviewText);

// Cambiar el tipo de letra en la previsualización
const fontBoxes = document.querySelectorAll('.font-box');
fontBoxes.forEach((fontBox) => {
    fontBox.addEventListener('click', () => {
        selectedFont = fontBox.dataset.font; // Obtener la fuente seleccionada
        updatePreviewText(); // Actualizar previsualización
        speakText(`Has seleccionado la fuente ${selectedFont}.`);
    });
});


// Exportar PDF con el fondo seleccionado y la tipografía elegida
// Función para exportar el PDF
document.getElementById('export-pdf-btn').addEventListener('click', async () => {
    const text = document.getElementById('output').value.trim();
    const recipient = document.getElementById('recipient').value.trim();
    const date = new Date().toLocaleDateString();

    if (!recipient || !text) {
        speakText('Por favor, completa todos los campos antes de exportar.');
        return;
    }

    // Crear el objeto jsPDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    if (selectedPreviewBackground) {
        const img = new Image();
        img.src = selectedPreviewBackground;

        img.onload = () => {
            // Agregar la imagen como fondo
            pdf.addImage(img, 'JPEG', 0, 0, pageWidth, pageHeight);

            // Agregar el texto al PDF
            addTextToPDF(pdf, recipient, date, text);

            // Guardar el archivo PDF
            pdf.save('mi_primera_carta_web.pdf');
        };

        img.onerror = () => {
            console.error('Error al cargar la imagen de fondo.');
            speakText('No se pudo cargar la imagen de fondo. Intenta nuevamente.');
        };
    } else {
        // Si no hay fondo, simplemente agrega el texto y guarda el PDF
        addTextToPDF(pdf, recipient, date, text);
        pdf.save('mi_primera_carta_web.pdf');
    }
});

function addTextToPDF(pdf, recipient, date, text) {
    const margin = 10;
    const usableWidth = pdf.internal.pageSize.getWidth() - margin * 2;

    pdf.setFont(selectedFont || 'helvetica', 'normal');
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 128);
    pdf.text(`Carta para: ${recipient}`, margin, margin + 10);

    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Fecha: ${date}`, margin, margin + 20);

    pdf.setFontSize(14);
    pdf.setTextColor(50, 50, 50);
    const textLines = pdf.splitTextToSize(text, usableWidth);
    pdf.text(textLines, margin, margin + 40);
}


document.getElementById("send-email-btn").addEventListener("click", function () {
    // Obtenemos el texto del placeholder o lo que el usuario haya escrito
    const textarea = document.getElementById("output");
    const message = textarea.value || textarea.placeholder;

    // Obtenemos el destinatario seleccionado
    const recipientInput = document.getElementById("recipient");
    const recipient = recipientInput.value || "destinatario@example.com";

    // Creamos el enlace mailto
    const subject = "Tu carta mágica";
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    // Abrimos el cliente de correo
    window.location.href = mailtoLink;
});






}


const fontBoxes = document.querySelectorAll('.font-box');
const backgroundBoxes = document.querySelectorAll('.background-box');

// Cambiar tipografía con un clic
fontBoxes.forEach((box) => {
    box.addEventListener('click', () => {
        const selectedFont = box.getAttribute('data-font');
        output.style.fontFamily = selectedFont;
        speakText(`Tipografía cambiada a ${selectedFont}`);
    });
});

// Cambiar fondo con un clic
backgroundBoxes.forEach((box) => {
    box.addEventListener('click', () => {
        const selectedColor = box.getAttribute('data-color');
        if (selectedColor) {
            output.style.backgroundColor = selectedColor;
            output.style.backgroundImage = 'none';
        } else if (box.classList.contains('custom-bg')) {
            const img = prompt('Ingresa la URL de la imagen de fondo personalizada:');
            if (img) {
                output.style.backgroundImage = `url(${img})`;
                output.style.backgroundSize = 'cover';
                speakText('Fondo personalizado aplicado.');
            }
        }
    });
});

const colorPicker = document.getElementById('color-picker');

// Cambiar fondo con el selector de color
colorPicker.addEventListener('input', () => {
    const selectedColor = colorPicker.value;
    output.style.backgroundColor = selectedColor;
    speakText(`Fondo cambiado a color ${selectedColor}`);
});



///

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('send-email-btn').addEventListener('click', () => {
        const recipient = recipientInput.value.trim(); // Obtener destinatario
        const text = output.value.trim(); // Obtener texto de la carta

        if (!recipient) {
            speakText('Por favor, ingresa el destinatario antes de enviar.');
            return;
        }

        if (!text) {
            speakText('El área de texto está vacía. Por favor, escribe algo antes de enviar.');
            return;
        }

        // Crear el asunto y cuerpo del mensaje
        const subject = `Carta para ${recipient}`;
        const body = `¡Hola!\n\nTe envío la siguiente carta:\n\n${text}\n\nAtentamente,\nTu Nombre`;

        // Crear el enlace mailto con los datos del formulario
        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        console.log("Enlace mailto:", mailtoLink); // Verifica que se genere correctamente

        // Abrir el cliente de correo con el contenido predefinido
        window.location.href = mailtoLink;
    });
});


//diseño pdf


const chooseBackgroundBtn = document.getElementById('choose-background-btn');
const backgroundFileInput = document.getElementById('background-file');
let selectedBackground = null; // Variable para almacenar el fondo elegido

// Evento para manejar el clic en el botón de elegir fondo
chooseBackgroundBtn.addEventListener('click', () => {
    backgroundFileInput.click(); // Abrir el selector de archivos
});

// Evento para manejar la selección de archivo (imagen)
backgroundFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedBackground = e.target.result; // Guardamos la imagen seleccionada
            alert("Fondo de PDF actualizado");
        };
        reader.readAsDataURL(file); // Convertir la imagen a base64
    }
});


let selectedPreviewBackground = ''; // Para almacenar el fondo seleccionado para la previsualización

// Actualizar la previsualización del fondo
function updatePreviewBackground() {
    const previewArea = document.getElementById('preview-area');
    if (selectedPreviewBackground) {
        previewArea.style.backgroundImage = `url(${selectedPreviewBackground})`; // Establecer el fondo de la previsualización
    } else {
        previewArea.style.backgroundImage = ''; // Si no se ha seleccionado fondo, mantener fondo blanco
    }
}



// Función para actualizar el texto de la carta en la previsualización
function updatePreviewText() {
    const recipient = recipientInput.value.trim() || '[Destinatario]';
    const date = new Date().toLocaleDateString();
    const text = output.value.trim() || 'Escribe tu carta aquí...';

    document.getElementById('preview-recipient-name').textContent = recipient;
    document.getElementById('preview-date').textContent = `Fecha: ${date}`;
    document.getElementById('preview-text').textContent = text;
}

// Actualizar previsualización cada vez que se graba o cambia el texto
recognition.onresult = (event) => {
    if (isPaused) return; // Ignorar resultados si está en pausa

    let interimTranscript = ''; // Texto intermedio

    for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
            // Acumular texto final evitando duplicación
            finalTranscript += event.results[i][0].transcript;
        } else {
            // Acumular texto intermedio
            interimTranscript += event.results[i][0].transcript;
        }
    }

    // Actualizar el contenido del textarea
    output.value = finalTranscript.trim(); // Mostrar solo texto final
    if (interimTranscript) {
        output.value += ` ${interimTranscript}`; // Añadir texto intermedio temporalmente
    }

    // Actualizar la previsualización del texto
    updatePreviewText();
};

// Llamar a la actualización de previsualización cuando se cambie el destinatario
recipientInput.addEventListener('input', updatePreviewText);