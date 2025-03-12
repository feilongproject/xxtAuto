import base64
import time
import pyaes
import requests


class AESCipher:
    AESKey = "u2oh6Vu^HWe4_AES"

    def __init__(self):
        self.key = str(self.AESKey).encode("utf8")
        self.iv = str(self.AESKey).encode("utf8")

    def encrypt(self, plaintext: str) -> str:
        ciphertext = b""
        cbc = pyaes.AESModeOfOperationCBC(self.key, self.iv)
        plaintext = plaintext.encode("utf-8")
        blocks = self.split_to_data_blocks(self.pkcs7_padding(plaintext))
        for b in blocks:
            ciphertext = ciphertext + cbc.encrypt(b)
        base64_text = base64.b64encode(ciphertext).decode("utf8")
        return base64_text

    def decrypt(self, ciphertext: str):
        cbc = pyaes.AESModeOfOperationCBC(self.key, self.iv)
        ciphertext.encode('utf8')
        ciphertext = base64.b64decode(ciphertext)
        ptext = b""
        for b in self.split_to_data_blocks(ciphertext):
            ptext = ptext + cbc.decrypt(b)
        return self.pkcs7_unpaid(ptext.decode())

    @staticmethod
    def pkcs7_unpaid(string):
        return string[0: -ord(string[-1])]

    @staticmethod
    def pkcs7_padding(s, block_size=16):
        bs = block_size
        return s + (bs - len(s) % bs) * chr(bs - len(s) % bs).encode()

    @staticmethod
    def split_to_data_blocks(byte_str, block_size=16):
        length = len(byte_str)
        j, y = divmod(length, block_size)
        blocks = []
        another = j * block_size
        for i in range(j):
            start = i * block_size
            end = (i + 1) * block_size
            blocks.append(byte_str[start:end])
        st = byte_str[another:]
        if st:
            blocks.append(st)
        return blocks


cipher = AESCipher()


def login(session: requests.Session, username: str, password: str):
    _data = {
        "fid": "-1",
        "uname": cipher.encrypt(username),
        "password": cipher.encrypt(password),
        "refer": "https%3A%2F%2Fi.chaoxing.com",
        "t": True,
        "forbidotherlogin": 0,
        "validate": "",
        "doubleFactorLogin": 0,
        "independentId": 0,
    }
    session.post("https://passport2.chaoxing.com/fanyalogin", data=_data)
    ck = requests.utils.dict_from_cookiejar(session.cookies)
    pass


def get_course_list(session: requests.Session):
    url = "https://mooc2-ans.chaoxing.com/mooc2-ans/visit/courselistdata"
    data = {"courseType": 1, "courseFolderId": 0, "query": "", "superstarClass": 0}
    headers = {
        "Host": "mooc2-ans.chaoxing.com",
        "sec-ch-ua-platform": '"Windows"',
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0",
        "Accept": "text/html, */*; q=0.01",
        "sec-ch-ua": '"Microsoft Edge";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua-mobile": "?0",
        "Origin": "https://mooc2-ans.chaoxing.com",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Referer": "https://mooc2-ans.chaoxing.com/mooc2-ans/visit/interaction?moocDomain=https://mooc1-1.chaoxing.com/mooc-ans",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6,ja;q=0.5",
    }
    return session.post(url, headers=headers, data=data).content.decode("utf8")


def get_active_list(session: requests.Session, courseId: str, classId: str):
    res = session.get(
        f"https://mobilelearn.chaoxing.com/v2/apis/active/student/activelist?fid=0&courseId={courseId}&classId={classId}").json()
    if res['errorMsg']:
        print(res['errorMsg'], end="")
        # time.sleep(1)
        return []
    data = [
        {
            "id": active['id'],
            "name": active['nameOne'],
            "startTime": active['startTime'] // 1000,
            "nameFour": active['nameFour'],
        }
        for active in res['data']['activeList']]
    return data


def answer(session: requests.Session, courseId: str, classId: str, activeId: str):
    res = session.get(
        f'https://mobilelearn.chaoxing.com/v2/apis/answer/stuAnswer?classId={classId}&courseId={courseId}&activeId={activeId}').json()

    return {
        "msg": res['msg'],
        'result': res['result'],
    }
