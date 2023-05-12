exports.isLoggedIn = (req,res,next) => {
    if (req.isAuthenticated()){
        next()
    }else{
        return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('로그인을 해주세요'); window.location='/page/login'</script></html>`);
    }
}

exports.isNotLoggedIn = (req,res,next) => {
    if (!req.isAuthenticated()){
        next()
    }else{
        return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('로그인 한 상태입니다'); window.location='/'</script></html>`);   
    }
}