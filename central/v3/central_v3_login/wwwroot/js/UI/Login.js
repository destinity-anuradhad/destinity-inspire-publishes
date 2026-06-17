
$(document).ready(function () {
    Login();
});

function showLoginError(message) {
    var $error = $('#login-error');
    var $text = $('#login-error-text');
    $text.text(message);
    $error.stop(true).fadeIn(200);
    setTimeout(function () {
        $error.fadeOut(400);
    }, 5000);
}

function setSubmitLoading(loading) {
    var $btn = $('#submit');
    var $text = $btn.find('.login-card__submit-text');
    var $loader = $btn.find('.login-card__submit-loader');
    if (loading) {
        $btn.prop('disabled', true).css('opacity', '0.75');
        $text.text('Signing in...');
        $loader.show();
    } else {
        $btn.prop('disabled', false).css('opacity', '1');
        $text.text('SUBMIT');
        $loader.hide();
    }
}

function Login() {
    $("form").submit(function (e) {
        e.preventDefault();

        $('#login-error').hide();

        if ($('#username').val() === undefined || $('#username').val() === "") {
            showLoginError('Please enter your username!');
        } else if ($('#password').val() === undefined || $('#password').val() === "") {
            showLoginError('Please enter your password!');
        } else {
            var loginUser = {
                UserName: $('#username').val(),
                Password: $('#password').val(),
                IpAddress: $('#Ipaddress').val()
            };

            setSubmitLoading(true);

            $.ajax({
                url: "/login/login",
                type: "POST",
                data: { user: loginUser },
                dataType: "json",
                success: function (data) {
                    if (data.FullName.startsWith("ERR-")) {
                        showLoginError(data.FullName.replace("ERR-", ""));
                    }
                    else if (data.FullName.startsWith("401-")) {
                        showLoginError(data.FullName.replace("401-", ""));
                    }
                    else {
                        if (data.IsPasswordResetRequested === false) {
                            window.location = "/properties/Index";
                        } else {
                            window.location = "/login/resetpassword";
                        }
                    }
                },
                error: function (xhr, status, error) {
                    showLoginError('Unable to connect. Please try again.');
                },
                complete: function () {
                    setSubmitLoading(false);
                }
            });
        }
    });
}
