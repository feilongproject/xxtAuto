import fs from "fs";
import { answer, getActiveList, getCourseList } from "./api";
import { decodeClassInfoHtml, getConfig, Session, sleep } from "./util";
import { question as input } from "readline-sync";


async function main() {

    const config = getConfig();
    // console.log(config);
    const session = new Session(config.cookies);

    let classInfoHtml = await getCourseList(session);
    if (classInfoHtml.includes('<title>用户登录</title>')) {
        // 没做登录
        console.log('请先登录');
        process.exit(1);
    }

    console.log("==========");
    const courseList = decodeClassInfoHtml(classInfoHtml);
    for (const [i, course] of courseList.entries()) {
        console.log(`[${i}]\t${course['classId']}\t${course['courseId']}\t${course['name']}`);
    }
    console.log("==========");
    // debugger;

    const courseNow = { courseId: "", classId: "", name: "" };
    if (config.courseId && config.classId) {
        const find = courseList.find(v => v.courseId == config.courseId && v.classId == config.classId);
        if (find) {
            courseNow.courseId = find.courseId;
            courseNow.classId = find.classId;
            courseNow.name = find.name;
            console.log(`设置读入：${courseNow.classId}\t${courseNow.courseId}\t${courseNow.name}`);
        } else {
            console.log('无效的设置，已清空');
            config.courseId = "";
            config.classId = "";
            fs.writeFileSync('config.json', JSON.stringify(config, null, 4));
        }
    }
    if (!courseNow.courseId || !courseNow.classId) {
        while (true) {
            const i = input("please input the course number: ");
            const course = courseList[parseInt(i)];
            if (!course) {
                console.log('no such course');
                continue;
            }
            courseNow.courseId = course.courseId;
            courseNow.classId = course.classId;
            courseNow.name = course.name;
            break;
        }
        config.courseId = courseNow.courseId;
        config.classId = courseNow.classId;
        fs.writeFileSync('config.json', JSON.stringify(config, null, 4));
    }
    console.log(`设置已选：${courseNow.classId}\t${courseNow.courseId}\t${courseNow.name}`);


    const timeCut = 10 * 1000;//20s
    console.log(`========== 开始抢答${timeCut / 1000}s内的活动`);
    const clickdActiveId: string[] = [];

    while (true) {
        process.stdout.write(`持续检测中...${new Date().toLocaleTimeString()}... `);

        const _activeList = await getActiveList(session, courseNow.courseId, courseNow.classId);
        const activeList = _activeList.filter(v => !clickdActiveId.includes(v.id) && v.startTime + timeCut > Date.now());
        process.stdout.write(`${_activeList.length}->${activeList.length} `);
        process.stdout.write(`[${new Date(_activeList[0].startTime).toLocaleTimeString()}/${_activeList[0].nameFour.split(' ').pop()}/${_activeList[0].name}] `);
        // debugger;
        if (activeList.length == 0) {
            process.stdout.write(`未找到有效活动\n`);
        } else {
            for (const active of activeList) {
                const result = await answer(session, courseNow.courseId, courseNow.classId, active.id);
                console.log(`抢答结果：${result.msg}\t${result.result}`);
                clickdActiveId.push(active.id);
            }
        }

        // debugger;
        await sleep(config.sleepTime * 1000);

    }



}


Buffer.prototype.json = function () {
    return JSON.parse(this.toString());
}

main().catch(console.error);