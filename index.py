import json
import time
import requests
import API
from util import decode_course_folder


def main():
    print()
    data = json.load(open("config.json"))
    session = requests.Session()
    session.cookies = requests.utils.cookiejar_from_dict(data["cookies"])
    session.headers['User-Agent'] = \
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0'

    classInfo = API.get_course_list(session)
    if '<title>用户登录</title>' in classInfo or '您所浏览的页面不存在' in classInfo:
        API.login(session, data["username"], data["password"])
        data['cookies'] = requests.utils.dict_from_cookiejar(session.cookies)
        open('config.json', 'w').write(json.dumps(data, indent=4))
    pass

    print("==========")
    course_list = decode_course_folder(classInfo)
    for i, course in enumerate(course_list):
        print(f"{i}\t{course['classId']}\t{course['courseId']}\t{course['name']}")
    print("==========")

    choice = 0
    course_now = course_list[choice]
    print(f"当前选择：{course_now['name']}")

    time_cut = 20
    print(f"========== 开始抢答，时间间隔：{time_cut}s")
    clickd_activeId = []
    while True:
        print(f"持续检测中......{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}...", end='')

        active_list = API.get_active_list(session, course_now['courseId'], course_now['classId'])
        active_list = [active for active in active_list if
                       active['startTime'] + time_cut > time.time() and active["id"] not in clickd_activeId]
        if len(active_list) == 0:
            # print("未检测到")
            pass
        else:
            print(f"> 发现抢答：" + '\t'.join([active['name'] + active['nameFour'] for active in active_list]))
            for active in active_list:
                res = API.answer(session, course_now['courseId'], course_now['classId'], active['id'])
                print(f"抢答结果：{res['msg']}\t{res['result']}")
                clickd_activeId.append(active['id'])
                pass

        time.sleep(1)


if __name__ == "__main__":
    main()
