import os
import json
from bs4 import BeautifulSoup


def loadconfig():
    config = {}
    if os.path.exists("config.json"):
        config = json.load(open("config.json"))
        config = {
            "username": config["username"] if "username" in config else "",
            "password": config["password"] if "password" in config else "",
            "classId": config["classId"] if "classId" in config else "",
            "courseId": config["courseId"] if "courseId" in config else "",
            "sleepTime": config["sleepTime"] if "sleepTime" in config else 1,
            "cookies": config["cookies"] if "cookies" in config else {},
        }
    else:
        config = {
            "username": "",
            "password": "",
            "classId": "",
            "courseId": "",
            "sleepTime": 1,
            "cookies": {},
        }
        print("未存在config.json，填写信息后生成")

    if config['username'] == '' or config['password'] == '':
        while True:
            username = input("请输入用户名：")
            password = input("请输入密码：")
            yes_or_no = input(f"请确认输入的账户名（{username}）密码（{password}）正确(Y/N)").lower().strip()
            if yes_or_no == 'y':
                config['username'] = username
                config['password'] = password
                break
    open('config.json', 'w').write(json.dumps(config, indent=4))
    return config


def decode_course_folder(text):
    soup = BeautifulSoup(text, "lxml")
    course_list_raw = soup.select(".course")
    course_list = []

    for course_raw in course_list_raw:
        course_list.append({
            "classId": course_raw.select(".clazzId")[0].attrs["value"],
            "courseId": course_raw.select(".courseId")[0].attrs["value"],
            "name": course_raw.select(".course-name")[0].attrs["title"],
        })

    return course_list
