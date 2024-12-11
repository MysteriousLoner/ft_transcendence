from dataclasses import dataclass

@dataclass
class UserCredential:
    username: str
    email:    str
    password: str