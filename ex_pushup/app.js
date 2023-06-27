/**
 * 
 * @param {Element} add hidden 클래스를 추가할 요소
 */
const hiddenClassAdd = function(add) {
    add.classList.add('hidden');
}

/**
 * 
 * @param {Element} remove hidden 클래스를 제거할 요소
 */
const hiddenClassRemove = function(remove) {
    remove.classList.remove('hidden');
}

const navMenuBtn = document.querySelector('.navMenuBtn');
const navLogin = document.querySelector('.navLogin');
const signupBtn = document.querySelector('.signup');
const loginBox = document.querySelector('.loginBox');
const signupBox = document.querySelector('.signupBox');

navMenuBtn.addEventListener('click', function(){
    const navMenu = document.querySelector('.navMenuContainer');
    navMenu.classList.toggle('active');
});

navLogin.addEventListener('click', function(){
    const mainContainer = document.querySelector('.mainContainer');
    const loginContainer = document.querySelector('.loginContainer');
    const tutorialContainer = document.querySelector('.tutorialContainer');

    hiddenClassAdd(mainContainer);
    hiddenClassAdd(tutorialContainer);
    hiddenClassAdd(signupBox);
    hiddenClassRemove(loginContainer);
    hiddenClassRemove(loginBox);
})

signupBtn.addEventListener('click', function(){
    hiddenClassAdd(loginBox);
    hiddenClassRemove(signupBox);
});


/**
 * 
 * @param {string} val 정규 표현식에 만족하는지 판별할 값
 * @param {Object} obj 정규 표현식, 유효성 검사 성공 여부, 오류 여부를 알려주는 공지 요소를 포함하는 객체
 */
const regExpTest = function(val, obj) {
    if(obj.regExp.test(val)) {
        obj.isValid = true;
        obj.notice.classList.add('hidden');
    } else {
        obj.isValid = false;
        obj.notice.classList.remove('hidden');
    }
}

const signupId = document.querySelector('#id');
const signupPwd = document.querySelector('#pwd');
const signupPwdConfirm = document.querySelector('#pwdConfirm');

const signupEmailLocal = document.querySelector('.emailLocal');
const signupEmailDomain = document.querySelector('.emailDomain');
const signupEmailSelect = document.querySelector('.emailSelect');

const signupYear = document.querySelector('#year');
const signupMonth = document.querySelector('#month');
const signupDay = document.querySelector('#day');

let isPwdConfirmValid = false;
let isMonthValid = false;
let isDayValid = false;

class SignupProfile {
    constructor(regExp, isValid, notice) {
        this.regExp = regExp;
        this.isValid = isValid;
        this.notice = notice;
    }
}

let id = new SignupProfile(
    /^(?=.*[a-z])(?=.*[0-9])[a-z0-9]{6,20}$/,
    false,
    document.querySelector('.profileId .notice')
);

let pwd = new SignupProfile(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/,
    false,
    document.querySelectorAll('.profilePwd .notice')[0]
);

let emailLocal = new SignupProfile(
    /^(?![-_.])[a-zA-Z0-9-_.]+$/,
    false,
    document.querySelector('.profileEmail .localNotice')
);

let emailDomain = new SignupProfile(
    /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
    false,
    document.querySelector('.profileEmail .domainNotice')
)

let year = new SignupProfile(
    /^(?:1[0-9]{3})$|^(?:20[01][0-9])$|^(?:20[2][0-3])$/,
    false,
    document.querySelector('.yearNotice')
)

signupId.addEventListener('change', function() {
    let idVal = signupId.value;
    regExpTest(idVal, id);
});

signupPwd.addEventListener('change', function() {
    let pwdVal = signupPwd.value;
    regExpTest(pwdVal, pwd);
});

signupPwd.addEventListener('change', function() {
    const pwdConfirmNotice = document.querySelectorAll('.profilePwd .notice')[1];
    let pwdConfirmVal = signupPwdConfirm.value;
    if(pwdConfirmVal !== ""){
        if(signupPwd.value === pwdConfirmVal) {
            isPwdConfirmValid = true;
            pwdConfirmNotice.classList.add('hidden');
        } else {
            isPwdConfirmValid = false;
            pwdConfirmNotice.classList.remove('hidden');
        }
    }
})

signupPwdConfirm.addEventListener('change', function() {
    const pwdConfirmNotice = document.querySelectorAll('.profilePwd .notice')[1];
    let pwdConfirmVal = signupPwdConfirm.value;
    if(signupPwd.value === pwdConfirmVal) {
        isPwdConfirmValid = true;
        pwdConfirmNotice.classList.add('hidden');
    } else {
        isPwdConfirmValid = false;
        pwdConfirmNotice.classList.remove('hidden');
    }
});

signupEmailSelect.addEventListener('change', function(e){
    const emailNotice = document.querySelector('.profileEmail .notice');
    if(e.target.value !== 'type'){
        signupEmailDomain.value = e.target.value;
        signupEmailDomain.disabled = true;
        emailDomain.isValid = true;
        emailNotice.classList.add('hidden');
    } else {
        signupEmailDomain.value = '';
        emailDomain.isValid = false;
        signupEmailDomain.disabled = false;
    }
});

signupEmailLocal.addEventListener('change', function(){
    let localVal = signupEmailLocal.value;
    regExpTest(localVal, emailLocal);
 });

 signupEmailDomain.addEventListener('change', function(){
    let domainVal = signupEmailDomain.value;
   regExpTest(domainVal, emailDomain);
});

signupYear.addEventListener('change', function() {
    let yearVal = signupYear.value;
    regExpTest(yearVal, year);
});

signupMonth.addEventListener('change', function(){
    const monthNotice = document.querySelector('.monthNotice');
    let monthVal;
    if(signupMonth.value !== 'type'){
        isMonthValid = true;
        monthVal = signupMonth.value;
        monthNotice.classList.add('hidden');
    } else {
        isMonthValid = false;
        monthNotice.classList.remove('hidden');
    }
});

signupMonth.addEventListener('change', function(){
    const dayNotice = document.querySelector('.dayNotice');
    let dayVal = signupDay.value;
    const dayRegExp = {
        jan: /^(?:[012]?[0-9])$|^(?:[3][01])$/,
        feb: /^(?:[01]?[0-9])$|^(?:[2][0-9])$/,
        mar: /^(?:[012]?[0-9])$|^(?:[3][01])$/,
        apr: /^(?:[012]?[0-9])$|^(?:[3][0])$/,
        may: /^(?:[012]?[0-9])$|^(?:[3][01])$/,
        jun: /^(?:[012]?[0-9])$|^(?:[3][0])$/,
        jul: /^(?:[012]?[0-9])$|^(?:[3][01])$/,
        aug: /^(?:[012]?[0-9])$|^(?:[3][01])$/,
        sep: /^(?:[012]?[0-9])$|^(?:[3][0])$/,
        oct: /^(?:[012]?[0-9])$|^(?:[3][01])$/,
        nov: /^(?:[012]?[0-9])$|^(?:[3][0])$/,
        dec: /^(?:[012]?[0-9])$|^(?:[3][01])$/,
    }
    if(isMonthValid && signupDay.value !== "") {
        if(Object.values(dayRegExp)[parseInt(signupMonth.value)-1].test(dayVal)) {
            isDayValid = true;
            dayNotice.classList.add('hidden');
        } else {
            isDayValid = false;
            dayNotice.classList.remove('hidden');
        }
    }
})

signupDay.addEventListener('change', function(){
    const dayNotice = document.querySelector('.dayNotice');
    let dayVal = signupDay.value;
    const dayRegExp = {
        jan: /^(?:[012]?[0-9])$|^(?:[3][01])$/,
        feb: /^(?:[01]?[0-9])$|^(?:[2][0-9])$/,
        mar: /^(?:[012]?[0-9])$|^(?:[3][01])$/,
        apr: /^(?:[012]?[0-9])$|^(?:[3][0])$/,
        may: /^(?:[012]?[0-9])$|^(?:[3][01])$/,
        jun: /^(?:[012]?[0-9])$|^(?:[3][0])$/,
        jul: /^(?:[012]?[0-9])$|^(?:[3][01])$/,
        aug: /^(?:[012]?[0-9])$|^(?:[3][01])$/,
        sep: /^(?:[012]?[0-9])$|^(?:[3][0])$/,
        oct: /^(?:[012]?[0-9])$|^(?:[3][01])$/,
        nov: /^(?:[012]?[0-9])$|^(?:[3][0])$/,
        dec: /^(?:[012]?[0-9])$|^(?:[3][01])$/,
    }
    if(Object.values(dayRegExp)[parseInt(signupMonth.value)-1].test(dayVal)) {
        isDayValid = true;
        dayNotice.classList.add('hidden');
    } else {
        isDayValid = false;
        dayNotice.classList.remove('hidden');
    }
})

const navTutorial = document.querySelectorAll('.navTutorial');

navTutorial.forEach(function(e) {
    e.addEventListener('click', function() {
        const mainContainer = document.querySelector('.mainContainer');
        const loginContainer = document.querySelector('.loginContainer');
        const tutorialContainer = document.querySelector('.tutorialContainer');
        const tutorialSquatBox = document.querySelector('.tutorialSquatBox');
        const tutoriaSideLungeBox = document.querySelector('.tutoriaSideLungeBox');
        const tutorialPlankBox = document.querySelector('.tutorialPlankBox');
        const tutorialShoulderPressBox = document.querySelector('.tutorialShoulderPressBox');

        hiddenClassAdd(mainContainer);
        hiddenClassAdd(loginContainer);
        hiddenClassRemove(tutorialContainer);

        if(e.classList.contains('tutorialSquat')) {

            hiddenClassRemove(tutorialSquatBox);
            document.querySelector('.tutorialSquatBox iframe').classList.remove('visibilityHidden');
            hiddenClassAdd(tutoriaSideLungeBox);
            document.querySelector('.tutoriaSideLungeBox iframe').classList.add('visibilityHidden');
            hiddenClassAdd(tutorialPlankBox);
            document.querySelector('.tutorialPlankBox iframe').classList.add('visibilityHidden');
            hiddenClassAdd(tutorialShoulderPressBox);
            document.querySelector('.tutorialShoulderPressBox iframe').classList.add('visibilityHidden');

        } else if(e.classList.contains('tutoriaSideLunge')) {

            hiddenClassRemove(tutoriaSideLungeBox);
            document.querySelector('.tutoriaSideLungeBox iframe').classList.remove('visibilityHidden');
            hiddenClassAdd(tutorialSquatBox);
            document.querySelector('.tutorialSquatBox iframe').classList.add('visibilityHidden');
            hiddenClassAdd(tutorialPlankBox);
            document.querySelector('.tutorialPlankBox iframe').classList.add('visibilityHidden');
            hiddenClassAdd(tutorialShoulderPressBox);
            document.querySelector('.tutorialShoulderPressBox iframe').classList.add('visibilityHidden');

        } else if(e.classList.contains('tutorialPlank')) {

            hiddenClassRemove(tutorialPlankBox); 
            document.querySelector('.tutorialPlankBox iframe').classList.remove('visibilityHidden');
            hiddenClassAdd(tutorialSquatBox);
            document.querySelector('.tutorialSquatBox iframe').classList.add('visibilityHidden');
            hiddenClassAdd(tutoriaSideLungeBox);
            document.querySelector('.tutoriaSideLungeBox iframe').classList.add('visibilityHidden');
            hiddenClassAdd(tutorialShoulderPressBox);
            document.querySelector('.tutorialShoulderPressBox iframe').classList.add('visibilityHidden');

        } else if(e.classList.contains('tutorialShoulderPress')) {

            hiddenClassRemove(tutorialShoulderPressBox);
            document.querySelector('.tutorialShoulderPressBox iframe').classList.remove('visibilityHidden');
            hiddenClassAdd(tutorialSquatBox);
            document.querySelector('.tutorialSquatBox iframe').classList.add('visibilityHidden');
            hiddenClassAdd(tutoriaSideLungeBox);
            document.querySelector('.tutoriaSideLungeBox iframe').classList.add('visibilityHidden');
            hiddenClassAdd(tutorialPlankBox);
            document.querySelector('.tutorialPlankBox iframe').classList.add('visibilityHidden');

        } else {
            
            hiddenClassRemove(tutorialSquatBox);
            document.querySelector('.tutorialSquatBox iframe').classList.remove('visibilityHidden');
            hiddenClassRemove(tutoriaSideLungeBox);
            document.querySelector('.tutoriaSideLungeBox iframe').classList.remove('visibilityHidden');
            hiddenClassRemove(tutorialPlankBox);
            document.querySelector('.tutorialPlankBox iframe').classList.remove('visibilityHidden');
            hiddenClassRemove(tutorialShoulderPressBox);
            document.querySelector('.tutorialShoulderPressBox iframe').classList.remove('visibilityHidden');
        }
    });
});