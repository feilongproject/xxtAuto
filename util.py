from bs4 import BeautifulSoup


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
