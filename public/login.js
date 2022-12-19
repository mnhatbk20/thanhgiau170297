
var islogin = Cookies.get('login') 
if (islogin !== undefined){

    if (islogin == 'true'){
        $("#screen2").removeClass("notlogin");
        $("#screen1").addClass("login");
    }
}else{
    $("#screen2").addClass("notlogin");
    $("#screen1").removeClass("login");
}
$("button#login").click(function(){
    var username = $("input#username").val();
    var password = $("input#password").val();
    if ((username == "thanhgiau")&&(password =="123456789")){
        $("#screen2").removeClass("notlogin");
        $("#screen1").addClass("login");
        Cookies.set('login', 'true', { expires: 1, secure: true })
    }
})