/////////// Sacar la lista de nodos de una network

//Este componente nos dara toda la lista de nodos de una red.
//Primero buscaremos todas las redes, y se añadiran en un desplegable.
//Cuando se seleccione la red del desplegable, se mostrarán los nodos de dicha red.
//Como todo estará registrado en una BD, lo sacaremos de ahí

import React, { useState } from "react";
import { useQuery } from 'react-query'

export function Nodos() {

    //Creamos un estado para guardar la red seleccionada y detectar cuando se cambia.
    const [selectedChainID, setSelectedChainID] = useState(null);
    const [chainError, setError] = useState(null)

    //Buscamos lista de redes
    const { data, isLoading, error } = useQuery('redes', () =>
        fetch('http://localhost:5555/redes').then((res) => {
            if (!res.ok) {
                throw new Error('Hubo un problema con la petición fetch');
            }
            return res.json();
        }));
    if (isLoading) {
        return <div>Cargando...</div>;
    }
    if (error) {
        return <div>Error: {error.message}</div>;
    }
    if (!data || data.length === 0) {
        return <div>No se encontraron datos</div>;
    }

    //Funcion para eliminar nodos
    const eliminarNodos = (nodo) =>{
        fetch(`http://localhost:5555/deleteNodo/${nodo}`).then((res) => {
            if (!res) {
                throw new Error('Hubo un error al eliminar el nodo')
            }
            return res.json()
        })
    }
    // Función para mostrar los nodos de la red seleccionada
    const mostrarNodos = () => {
        // Verifica si data y selectedChainID son válidos
        if (!data || !selectedChainID) {
            return <div>Selecciona una red válida para ver los nodos.</div>;
        }
        // Busca la red seleccionada por su ID
        // Si encuentra datos con la red seleccionada, nos muestra los nodos, y nos aparece con un botón en cada uno para eliminar
        // Sinó, nos lanza un error
        const redSeleccionada = data.find((chain) => chain.CHAIN_ID === selectedChainID);
        if (redSeleccionada) {
            return (
                <div>
                    <h2>Nodos de la red {redSeleccionada.CHAIN_ID}:</h2>
                    <ul>
                        {redSeleccionada.nodos?.map((nodo) => (
                            <div>
                                <table>
                                    <tr>
                                        <td><li key={nodo}>{nodo}</li></td>
                                        <td><button type="button" className="btn btn-outline-primary" onSubmit={eliminarNodos(nodo)}>Eliminar</button></td>
                                    </tr>
                                </table>
                            </div>
                        ))}
                    </ul>
                </div>
            );
        } else {
            return <div>No se encontró la red con el ID {selectedChainID}.</div>;
        }
    };
    //Ahora creamos una lista, el select tiene la opcion de onChange, el cual nos cambiará el estado de la red seleccionada
    //Con el estado cambiado, fuera de el select, llamamos a la funcion mostrarNodos, que con la red seleccionada, nos mostrara todos los nodos de dicha red
    return (
        <div><h1>Lista de redes:</h1>
            <select
                className="form-select form-select-lg mb-3"
                aria-label=".form-select-lg example"
                onChange={(e) => setSelectedChainID(e.target.value)}
                value={selectedChainID || ''} // Establece un valor predeterminado si selectedChainID está vacío
            >
                {data.length > 0 ? (
                    // Renderiza las opciones solo si hay datos disponibles
                    data.map((chain) => (
                        <option key={chain.CHAIN_ID} value={chain.CHAIN_ID}>
                            {chain.CHAIN_ID}
                        </option>
                    ))
                ) : (
                    <option value="" disabled>No hay datos disponibles</option>
                )}
            </select>
            {mostrarNodos()}
            {error && <p className="alert alert-success">{error.message}</p>}
            {chainError && <p className="alert alert-success">{chainError}</p>}
        </div>
    );
}