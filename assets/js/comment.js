function handleCommentClick() {
    const isLoggedIn = localStorage.getItem('userToken'); // Contoh cek session
    if (!isLoggedIn) {
        showLoginModal(); // Arahkan atau munculkan pop-up login
    } else {
        enableCommentForm();
    }
}