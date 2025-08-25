from pydantic import BaseModel, EmailStr, ConfigDict


class HuespedBase(BaseModel):
    nombre_completo: str
    telefono: str | None = None
    email: EmailStr | None = None


class HuespedCreate(HuespedBase):
    pass


class Huesped(HuespedBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
