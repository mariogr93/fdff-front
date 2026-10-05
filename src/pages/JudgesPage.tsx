import { useNavigate } from "react-router-dom";

export const JudgesPage = () => {

  const navigate = useNavigate();
  return (
    <div>
      <div className="flex flex-row items-center justify-center h-screen gap-4">
        <div className="flex flex-col items-center justify-between bg-surface rounded-md p-4 w-[300px] h-[300px]  
        cursor-pointer transition-transform duration-300 ease-base hover:scale-105 " onClick={() => {navigate("/create-competition")}}>
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-heading font-bold">Crear competencia</h2>
            <p className="text-small text-ink-muted">Crea una nueva competencia.</p>
          </div>
          <img
            src="/trophy.jpg"
            alt="Crear competencia"
            className="w-[100px] h-[100px] object-cover"
          />
        </div>
        <div className="flex flex-col items-center justify-between bg-surface rounded-md p-4 w-[300px] h-[300px]  
                        cursor-pointer transition-transform duration-300 ease-base hover:scale-105 " onClick={() => {navigate("/create-category")}}>
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-heading font-bold">Crear categoria</h2>
            <p className="text-small text-ink-muted">
              Crea una nueva categoria para tus competencias.
            </p>
          </div>

          <img src="/categories.jpg" alt="Crear categoria" className="w-full" />
        </div>
      </div>
    </div>
  );
};
