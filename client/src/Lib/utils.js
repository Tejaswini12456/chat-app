export function FormatMessageTime(timestamp){
    return new Date(timestamp).toLocaleString([],{
 hour:"2-digit",
        minute:"2-digit",
        hour12:false,
    }
        

        

    )
}