
// we need to do this because typescript does not recognize our 
// custom env vars directly
export default function(window:any){

    return {
        token: window.window_env.token,
        org: window.window_env.org
    }
}