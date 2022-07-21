function buildName(firstName:string,lastName?:string) {
    if(lastName) return firstName + ' ' + lastName
    return firstName
}
function buildName2(firstName: string, ...restOfName: string[]) {
    return firstName + " " + restOfName.join(" ");
}
  
let employeeName = buildName2("Joseph", "Samuel", "Lucas", "MacKinzie");