// js/file-upload.js
class FileUploadManager {
    constructor() {
        this.maxFileSizes = {
            default: 5 * 1024 * 1024, // 5MB
            photo: 2 * 1024 * 1024,   // 2MB
            documents: 10 * 1024 * 1024 // 10MB
        };

        this.allowedTypes = {
            documents: ['pdf', 'doc', 'docx'],
            images: ['jpg', 'jpeg', 'png', 'gif'],
            pdf: ['pdf']
        };

        this.init();
    }

    init() {
        this.initializeFileInputs();
        this.setupGlobalDragAndDrop();
    }

    initializeFileInputs() {
        const fileInputs = document.querySelectorAll('input[type="file"]');

        fileInputs.forEach(input => {
            this.setupFileInput(input);
        });
    }

    setupFileInput(input) {
        const wrapper = input.closest('.file-input-wrapper');
        if (!wrapper) return;

        // File selection event
        input.addEventListener('change', (e) => {
            this.handleFileSelection(e.target);
        });

        // Drag and drop events
        this.setupDragAndDrop(wrapper, input);

        // Click to select
        wrapper.addEventListener('click', (e) => {
            if (e.target === wrapper || e.target.closest('.file-input-display')) {
                input.click();
            }
        });
    }

    setupDragAndDrop(wrapper, input) {
        wrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
            wrapper.classList.add('drag-over');
        });

        wrapper.addEventListener('dragleave', (e) => {
            e.preventDefault();
            if (!wrapper.contains(e.relatedTarget)) {
                wrapper.classList.remove('drag-over');
            }
        });

        wrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            wrapper.classList.remove('drag-over');

            const files = Array.from(e.dataTransfer.files);
            this.handleDroppedFiles(input, files);
        });
    }

    setupGlobalDragAndDrop() {
        // Prevent default drag behaviors on document
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
    }

    handleFileSelection(input) {
        const files = Array.from(input.files);
        this.processFiles(input, files);
    }

    handleDroppedFiles(input, files) {
        // Create a new FileList for the input
        const dt = new DataTransfer();

        files.forEach(file => {
            if (this.validateFile(input, file)) {
                dt.items.add(file);
            }
        });

        input.files = dt.files;
        this.processFiles(input, Array.from(dt.files));
    }

    processFiles(input, files) {
        if (files.length === 0) return;

        const validFiles = files.filter(file => this.validateFile(input, file));

        if (validFiles.length > 0) {
            this.updateFileDisplay(input, validFiles);
            this.clearError(input);

            // Upload files immediately if needed
            if (input.dataset.uploadImmediately === 'true') {
                this.uploadFiles(input, validFiles);
            }
        }
    }

    validateFile(input, file) {
        const maxSize = this.getMaxFileSize(input);
        const allowedTypes = this.getAllowedFileTypes(input);

        // Size validation
        if (file.size > maxSize) {
            this.showError(input, `Datei "${file.name}" ist zu groß. Maximum: ${this.formatFileSize(maxSize)}`);
            return false;
        }

        // Type validation
        const extension = file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(extension)) {
            this.showError(input, `Dateityp "${extension}" ist nicht erlaubt. Erlaubt: ${allowedTypes.join(', ')}`);
            return false;
        }

        return true;
    }

    getMaxFileSize(input) {
        // Check data attribute first
        if (input.dataset.maxSize) {
            return parseInt(input.dataset.maxSize);
        }

        // Determine by input name/id
        const name = input.name || input.id;

        if (name.includes('foto') || name.includes('photo') || name.includes('bild')) {
            return this.maxFileSizes.photo;
        }

        if (name.includes('zeugnisse') || name.includes('certificates')) {
            return this.maxFileSizes.documents;
        }

        return this.maxFileSizes.default;
    }

    getAllowedFileTypes(input) {
        // Check accept attribute
        if (input.accept) {
            return input.accept.split(',').map(type => {
                if (type.startsWith('.')) {
                    return type.substring(1);
                }
                return type.split('/')[1] || type;
            });
        }

        // Determine by input name/id
        const name = input.name || input.id;

        if (name.includes('foto') || name.includes('photo') || name.includes('bild')) {
            return this.allowedTypes.images;
        }

        if (name.includes('zeugnisse') || name.includes('certificates')) {
            return this.allowedTypes.pdf;
        }

        return this.allowedTypes.documents;
    }

    updateFileDisplay(input, files) {
        const wrapper = input.closest('.file-input-wrapper');
        const display = wrapper.querySelector('.file-input-display');
        const textElement = display.querySelector('.file-text');
        const iconElement = display.querySelector('.file-icon');

        wrapper.classList.add('has-file');

        if (files.length === 1) {
            const file = files[0];
            textElement.textContent = `✓ ${file.name} (${this.formatFileSize(file.size)})`;
            iconElement.textContent = this.getFileIcon(file);
        } else {
            textElement.textContent = `✓ ${files.length} Dateien ausgewählt`;
            iconElement.textContent = '📁';
        }

        // Show progress if needed
        this.showProgress(input, files);
    }

    showProgress(input, files) {
        const wrapper = input.closest('.file-upload-group');
        let progressElement = wrapper.querySelector('.file-progress');

        if (!progressElement) {
            progressElement = document.createElement('div');
            progressElement.className = 'file-progress';
            progressElement.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-text">Dateien werden verarbeitet...</div>
            `;
            wrapper.appendChild(progressElement);
        }

        progressElement.style.display = 'block';

        // Simulate progress
        const progressBar = progressElement.querySelector('.progress-fill');
        let progress = 0;

        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    progressElement.style.display = 'none';
                }, 1000);
            }
            progressBar.style.width = progress + '%';
        }, 200);
    }

    getFileIcon(file) {
        const extension = file.name.split('.').pop().toLowerCase();

        const icons = {
            pdf: '📄',
            doc: '📝',
            docx: '📝',
            jpg: '🖼️',
            jpeg: '🖼️',
            png: '🖼️',
            gif: '🖼️'
        };

        return icons[extension] || '📎';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showError(input, message) {
        const wrapper = input.closest('.file-upload-group');
        let errorElement = wrapper.querySelector('.file-error');

        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'file-error alert alert-error';
            wrapper.appendChild(errorElement);
        }

        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    clearError(input) {
        const wrapper = input.closest('.file-upload-group');
        const errorElement = wrapper.querySelector('.file-error');

        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    async uploadFiles(input, files) {
        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append(`${input.name}[${index}]`, file);
        });

        try {
            const response = await fetch('../php/file-upload-handler.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                console.log('Files uploaded successfully:', result.files);
            } else {
                this.showError(input, result.message || 'Upload fehlgeschlagen');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showError(input, 'Upload fehlgeschlagen');
        }
    }
}

// Initialize file upload manager
document.addEventListener('DOMContentLoaded', () => {
    new FileUploadManager();
});