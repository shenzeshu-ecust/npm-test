const logObject = [
    {
        type: "normal",
        message: "SUCCESS: 2 + 2 is 4"
    },
    {
        type: "normal",
        message: "SUCCESS 5 + 5 is 10"
    },
    {
        type: "error",
        message: "ERROR! 3 + 3 is not 4"
    },
    {
        type: "normal",
        message: "SUCESS 10 - 4 is 6"
    }
]

function logger() {
    logObject.forEach(log => {
        setTimeout(() => {
            if (log.type === "normal") process.stdout.write(log.message)
            else process.stderr.write(log.message + '\n')
        }, 500)
    })
}

logger()

