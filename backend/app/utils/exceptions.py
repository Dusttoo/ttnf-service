class CustomError(Exception):
    def __init__(self, name: str, message: str):
        self.name = name
        self.message = message


class NotFoundError(CustomError):
    pass


class PermissionDeniedError(CustomError):
    pass


class ValidationError(CustomError):
    pass
