<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>OAuth Callback</title>
</head>
<body>
    <script>
        if (window.opener) {
            window.opener.postMessage({
                status: "{{ $status }}",
                user: {
                    id: {{ $user['id'] }},
                    username: "{{ $user['username'] }}",
                    email: "{{ $user['email'] }}",
                    profilePic: "{{ $user['profile_pic'] ?? '' }}",
                    method: "{{ request()->segment(2) }}" // extracts google, fb, x
                }
            }, '*');
            window.close();
        } else {
            window.location.href = '/';
        }
    </script>
</body>
</html>
