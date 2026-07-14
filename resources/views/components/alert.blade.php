<div id="customAlert" class="modal-overlay" style="display: none;">
    <div class="modal-box">
        <div id="alertIconContainer" class="modal-icon-alert">
            <i id="alertIcon" class="fas fa-exclamation-circle"></i>
        </div>
        <h3 id="alertTitle" class="modal-title">Pemberitahuan</h3>
        <p id="alertMessage" class="modal-text"></p>
        <button id="alertBtn" onclick="closeAlert()" class="modal-btn-primary">OK</button>
    </div>
</div>

<script>
    if (typeof window.closeAlert !== 'function') {
        window.closeAlert = function() {
            const alertBox = document.getElementById('customAlert');
            if (alertBox) {
                alertBox.style.display = 'none';
            }
        };
    }

    if (typeof window.showAlert !== 'function') {
        window.showAlert = function(message, type = 'error') {
            const alertBox = document.getElementById('customAlert');
            const alertMsg = document.getElementById('alertMessage');
            const alertIconContainer = document.getElementById('alertIconContainer');
            const alertIcon = document.getElementById('alertIcon');
            const alertTitle = document.getElementById('alertTitle');
            const alertBtn = document.getElementById('alertBtn');
            
            if (alertBox && alertMsg) {
                alertMsg.innerText = message;
                
                if (type === 'success') {
                    alertTitle.innerText = "Sukses";
                    if (alertIconContainer) {
                        alertIconContainer.className = "modal-icon-success";
                        alertIconContainer.removeAttribute('style');
                    }
                    if (alertIcon) {
                        alertIcon.className = "fas fa-check-circle";
                        alertIcon.removeAttribute('style');
                    }
                    if (alertBtn) {
                        alertBtn.className = "modal-btn-success";
                        alertBtn.removeAttribute('style');
                    }
                } else {
                    alertTitle.innerText = "Gagal";
                    if (alertIconContainer) {
                        alertIconContainer.className = "modal-icon-alert";
                        alertIconContainer.removeAttribute('style');
                    }
                    if (alertIcon) {
                        alertIcon.className = "fas fa-exclamation-circle";
                        alertIcon.removeAttribute('style');
                    }
                    if (alertBtn) {
                        alertBtn.className = "modal-btn-primary";
                        alertBtn.removeAttribute('style');
                    }
                }
                
                alertBox.style.display = 'flex';
            }
        };
    }
</script>
