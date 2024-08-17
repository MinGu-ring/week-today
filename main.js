/**
 * 주어진 년도가 윤년인지 반환합니다.
 * @param {number} year
 * @returns {boolean}
 */
function isLeap(year) {
    if (year % 400 == 0) { return true }
    else if (year % 100 == 0) { return false }
    else if (year % 4 == 0) { return true }
    return false
}

/**
 * 주어진 년도의 마지막 요일을 반환합니다.
 * @param {number} year
 * @returns {number} [0..6]. 0은 일요일, 6은 토요일.
 */
function pYear(year) {
    return (year + Math.floor(year / 4)
        - Math.floor(year / 100)
        + Math.floor(year / 400)) % 7
}

/**
 * 주어진 년도의 마지막 주수를 반환합니다.
 *
 * 작년이 수요일로 끝났거나 올해가 목요일로 끝났다면 53을, 그 외에는 52를 반환합니다.
 * @param {number} year
 * @returns {52 | 53}
 */
function lastWeek(year) {
    if (pYear(year) == 4 || pYear(year - 1) == 3) {
        return 53
    }
    return 52
}

/**
 * 주어진 날짜가 올해의 몇번째 날인지 반환합니다.
 * @param {Date} date
 * @returns {number}
 */
function ordinalDays(date) {
    // index 0은 1월 0일의 누적 일수
    const ordinalTable = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
    const leapOrdinalTable = ordinalTable.map((value, index) => index >= 2 ? value : value + 1)

    if (isLeap(date.getFullYear())) {
        return leapOrdinalTable[date.getMonth()] + date.getDate()
    } else {
        return ordinalTable[date.getMonth()] + date.getDate()
    }
}

/**
 * 주어진 날의 주수를 반환합니다.
 * @param {Date} date
 * @returns {number}
 */
function weekNumber(date) {
    const ordinal_days = ordinalDays(date)
    const current_year = date.getFullYear()
    // weekday: 월요일-일요일 = 1-7
    const weekday = date.getDay() ? date.getDay() : 7
    const week = Math.floor((ordinal_days - weekday + 10) / 7)

    if (week < 1) { return lastWeek(current_year - 1) }
    else if (week > lastWeek(current_year)) { return 1 }
    else { return week }
}

/**
 * 0과 1 사이의 소수를 받아 퍼센트가 붙은 문자열로 표현합니다.
 * @param {number} float
 * @returns {string}
 */
function toPercentage(float) {
    return (float * 100).toFixed(1) + "%"
}

/**
 * 주어진 날이 해당 주에서 어느정도 지났는지 구합니다.
 * @param {number} float
 * @returns {number} 0~1 사이의 소수.
 */
function getPercentageOfWeek(date) {
    // weekday: 월요일-일요일 = 1-7
    const weekday = date.getDay() ? date.getDay() : 7

    const startOfWeek = new Date(date.getFullYear(), date.getMonth(), date.getDate() - weekday + 1)
    const endOfWeek = new Date(date.getFullYear(), date.getMonth(), date.getDate() + (7 - weekday), 23, 59, 59, 99)

    const totalDays = endOfWeek - startOfWeek
    const elpasedDays = date - startOfWeek

    return elpasedDays / totalDays
}

/**
 * 주어진 날을 'YYYY년 m월 d일 0요일' 꼴로 바꿉니다.
 * @param {Date} date
 * @returns {string} 'YYYY년 m월 d일 0요일' 형식의 문자열
 */
function formatDate(date) {
    const weekday_title = ['', '월', '화', '수', '목', '금', '토', '일']
    // weekday: 월요일-일요일 = 1-7
    const weekday = date.getDay() ? date.getDay() : 7
    return date.getFullYear() + "년 " + (date.getMonth() + 1) + "월 " + date.getDate() + "일 " + weekday_title[weekday] +"요일"
}

/**
 * 1년의 시간, 분, 초를 계산하고 DOM에 표시합니다.
 */
function calculateYear() {
    const currentYear = new Date().getFullYear();
    const daysInYear = isLeap(currentYear) ? 366 : 365;
    const hoursInDay = 24;
    const minutesInHour = 60;
    const secondsInMinute = 60;

    const hoursInYear = daysInYear * hoursInDay;
    const minutesInYear = hoursInYear * minutesInHour;
    const secondsInYear = minutesInYear * secondsInMinute;

    document.getElementById('hours').textContent = `${hoursInYear.toLocaleString()} 시간`;
    document.getElementById('minutes').textContent = `${minutesInYear.toLocaleString()} 분`;
    document.getElementById('seconds').textContent = `${secondsInYear.toLocaleString()} 초`;
}

/**
 * 주어진 날을 기반으로 DOM에 정보를 채워 넣습니다.
 * @param {Date} date
 * @returns {undefined}
 */
function renderPage(date) {
    const week_number = weekNumber(date);

    const week_number_dom = document.getElementById('week-number');
    week_number_dom.innerText = week_number;

    const last_week_dom = document.getElementById('last-week');
    last_week_dom.innerText = lastWeek(date.getFullYear());

    calculateYear();

    // 올해의 퍼센티지를 표시하는 부분
    const year_percentage_dom = document.getElementById('year-percentage');      // 올해의 진행률 텍스트
    const year_progress_dom = document.querySelector('.progress-bar .progress'); // 프로그래스 바
    const yearPercentage = getYearPercentage();                                  // 올해의 진행률 계산
    year_progress_dom.style['width'] = yearPercentage * 100 + '%';               // 프로그래스 바의 너비 설정
    year_percentage_dom.innerText = toPercentage(yearPercentage);                // 텍스트로 진행률 표시

    const today_dom = document.getElementById('today');
    today_dom.innerText = formatDate(date);
}


/**
 * 올해가 지난 정도를 구간 [0, 1]의 숫자로 반환합니다.
 * @returns {number} between [0, 1]
 */
function getYearPercentage() {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const end = new Date(now.getFullYear() + 1, 0, 1)

    return (now - start) / (end - start)
}

document.addEventListener('DOMContentLoaded', function () {
    renderPage(new Date())
    setInterval(function () {
        renderPage(new Date())
    }, 1000)
})