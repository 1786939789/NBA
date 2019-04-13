function get_random_index() {
    var date = new Date().getTime();
    var random = Math.ceil(Math.random()*23)*Math.ceil(Math.random()*37) * Number(date);
    var list = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; //共62个
    var index ='';
    while (random){
        index += list.charAt(random%62);
        random = Math.floor(random/10);
    }
    return index;
}
/* 队名中文英文转换 */
var team_chinese_to_english = {
    '火箭': 'rockets',
    '湖人': 'lakers',
    '马刺': 'spurs',
    '鹈鹕': 'pelicans',
    '独行侠': 'mavericks',
    '灰熊': 'grizzlies',
    '勇士': 'warriors',
    '快船': 'clippers',
    '国王': 'kings',
    '太阳': 'suns',
    '掘金': 'nuggets',
    '雷霆': 'thunder',
    '开拓者': 'blazers',
    '爵士': 'jazz',
    '森林狼': 'timberwolves',
    '猛龙': 'raptors',
    '76人': '76ers',
    '凯尔特人': 'celtics',
    '篮网': 'nets',
    '尼克斯': 'knicks',
    '热火': 'heat',
    '黄蜂': 'hornets',
    '奇才': 'wizards',
    '魔术': 'magic',
    '老鹰': 'hawks',
    '雄鹿': 'bucks',
    '步行者': 'pacers',
    '活塞': 'pistons',
    '公牛': 'bulls',
    '骑士': 'cavaliers',
}
// replace(/(^\s*)|(\s*$)/g, "")