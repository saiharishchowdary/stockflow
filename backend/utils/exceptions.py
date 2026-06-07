from fastapi import HTTPException, status


class StockInsufficientError(HTTPException):
    def __init__(self, failures: list[dict]):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Insufficient stock",
                "failures": failures,
            },
        )


class DuplicateSKUError(HTTPException):
    def __init__(self, sku: str = ""):
        msg = f"SKU '{sku}' already exists" if sku else "SKU already exists"
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=msg)


class DuplicateEmailError(HTTPException):
    def __init__(self, email: str = ""):
        msg = f"Email '{email}' is already registered" if email else "Email already exists"
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=msg)


class NotFoundError(HTTPException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} not found",
        )


class UnauthorizedError(HTTPException):
    def __init__(self, detail: str = "Invalid credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class ForbiddenError(HTTPException):
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)
