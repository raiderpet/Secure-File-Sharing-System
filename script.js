class SecureShare {
    constructor() {
        this.isAuthenticated = false;
        this.files = [];
        this.logs = [];
        this.init();
    }

    init() {
        // DOM Elements
        this.authSection = document.getElementById('auth-section');
        this.fileSection = document.getElementById('file-section');
        this.loginForm = document.getElementById('login-form');
        this.dropZone = document.getElementById('drop-zone');
        this.fileInput = document.getElementById('file-input');
        this.filesContainer = document.getElementById('files-container');
        this.logContainer = document.getElementById('log-container');

        // Event Listeners
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.dropZone.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.setupDragAndDrop();

        // Load saved data
        this.loadData();
        this.renderLogs();
    }

    setupDragAndDrop() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => {
                this.dropZone.classList.add('drag-active');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => {
                this.dropZone.classList.remove('drag-active');
            });
        });

        this.dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simple authentication for demo
        if (username === 'admin' && password === 'admin') {
            this.isAuthenticated = true;
            this.authSection.classList.add('hidden');
            this.fileSection.classList.remove('hidden');
            this.addLog('User logged in successfully');
        } else {
            alert('Invalid credentials');
            this.addLog('Failed login attempt');
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        this.handleFiles(files);
    }

    handleFiles(files) {
        Array.from(files).forEach(file => {
            this.encryptAndSaveFile(file);
        });
    }

    encryptAndSaveFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const encrypted = this.encryptData(e.target.result);
            const fileData = {
                id: Date.now(),
                name: file.name,
                type: file.type,
                size: file.size,
                encrypted: encrypted,
                timestamp: new Date().toISOString()
            };

            this.files.push(fileData);
            this.saveData();
            this.renderFiles();
            this.addLog(`File uploaded: ${file.name}`);
        };
        reader.readAsDataURL(file);
    }

    encryptData(data) {
        // Simple encryption for demo purposes
        return CryptoJS.AES.encrypt(data, 'secret-key').toString();
    }

    decryptData(encrypted) {
        // Simple decryption for demo purposes
        return CryptoJS.AES.decrypt(encrypted, 'secret-key').toString(CryptoJS.enc.Utf8);
    }

    downloadFile(id) {
        const file = this.files.find(f => f.id === id);
        if (file) {
            const decrypted = this.decryptData(file.encrypted);
            const link = document.createElement('a');
            link.href = decrypted;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            this.addLog(`File downloaded: ${file.name}`);
        }
    }

    deleteFile(id) {
        const file = this.files.find(f => f.id === id);
        this.files = this.files.filter(f => f.id !== id);
        this.saveData();
        this.renderFiles();
        this.addLog(`File deleted: ${file.name}`);
    }

    renderFiles() {
        this.filesContainer.innerHTML = this.files.map(file => `
            <div class="file-item">
                <i class="fas fa-file"></i>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">
                        ${this.formatSize(file.size)} • 
                        ${new Date(file.timestamp).toLocaleString()}
                    </div>
                </div>
                <div class="file-actions">
                    <button class="download-btn" onclick="secureShare.downloadFile(${file.id})">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="delete-btn" onclick="secureShare.deleteFile(${file.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    addLog(message) {
        const log = {
            message,
            timestamp: new Date().toISOString()
        };
        this.logs.unshift(log);
        this.saveData();
        this.renderLogs();
    }

    renderLogs() {
        this.logContainer.innerHTML = this.logs.map(log => `
            <div class="log-item">
                <span class="log-timestamp">${new Date(log.timestamp).toLocaleString()}</span>
                <div class="log-message">${log.message}</div>
            </div>
        `).join('');
    }

    formatSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    saveData() {
        localStorage.setItem('secureShare_files', JSON.stringify(this.files));
        localStorage.setItem('secureShare_logs', JSON.stringify(this.logs));
    }

    loadData() {
        const savedFiles = localStorage.getItem('secureShare_files');
        const savedLogs = localStorage.getItem('secureShare_logs');
        if (savedFiles) this.files = JSON.parse(savedFiles);
        if (savedLogs) this.logs = JSON.parse(savedLogs);
        this.renderFiles();
    }
}

// Initialize SecureShare
const secureShare = new SecureShare();
