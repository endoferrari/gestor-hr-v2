from pydantic import BaseModel, EmailStr


class HuespedBase(BaseModel):
    nombre_completo: str
    telefono: str | None = None
    email: EmailStr | None = None


class HuespedCreate(HuespedBase):
    pass


class Huesped(HuespedBase):
    id: int

    class Config:
        from_attributes = True
