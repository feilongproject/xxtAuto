import fetch from 'node-fetch';
import { Session } from './util';


const headers = {
    "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
}


export async function getCourseList(session: Session) {

    const res = await session.post("https://mooc2-ans.chaoxing.com/mooc2-ans/visit/courselistdata", {
        headers: {
            ...headers,
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: `courseType=1&courseFolderId=0&query=&pageHeader=-1&single=0&superstarClass=0`,
    });

    const data = await res.text();
    // console.log(data);
    return data;
}

export async function getActiveList(session: Session, courseId: string, classId: string) {

    // const res = await session.get(`https://mobilelearn.chaoxing.com/v2/apis/active/student/activelist?fid=0&courseId=${courseId}&classId=${classId}`);
    // const data = await res.json();
    // return (data.data.activeList as any[]).map((v: any) => ({
    //     "id": v.id.toString() as string,
    //     "name": v.nameOne as string,
    //     "startTime": v.startTime as number,
    //     "nameFour": v.nameFour as string,
    // }));

    const res = await session.get(`https://mobilelearn.chaoxing.com/ppt/activeAPI/taskactivelist?courseId=${courseId}&classId=${classId}`, {
        headers: {
            "User-Agent": 'Dalvik/2.1.0 (Linux; U; Android 15; 23078RKD5C Build/AP3A.240617.008) (schild:0d86023fbb32fbbc72ab46484da6015f) (device:23078RKD5C) Language/zh_CN com.chaoxing.mobile/ChaoXingStudy_3_6.5.2_android_phone_10838_265 (@Kalimdor)_602d628f42734472a80634404b29d4f3',
        },
    });
    const data = await res.json();

    return (data.activeList as any[]).map((v: any) => ({
        "id": v.id.toString() as string,
        "name": v.nameOne as string,
        "startTime": v.startTime as number,
        "nameFour": v.nameTwo as string,
    }));
}

export async function answer(session: Session, courseId: string, classId: string, activeId: string) {
    const res = await session.get(`https://mobilelearn.chaoxing.com/v2/apis/answer/stuAnswer?classId=${classId}&courseId=${courseId}&activeId=${activeId}`);
    const data = await res.json();
    // debugger;
    return {
        msg: data.msg,
        result: data.result,
    }
}