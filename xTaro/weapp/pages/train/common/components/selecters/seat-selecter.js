export default {
    data: {
        showType: '',
        otherTrainsSeatsArr: [],
        otherSeats: [],
        otherSeatStr: '',
        disabledSeat: '',
        disabledSeats: [],
    },
    methods: {
        showOtherSeat(chosenSeatList, otherSeats) {
            let otherTrainsSeatsArr = this.data.otherTrainsSeatsArr
            otherTrainsSeatsArr.forEach((s, idx) => {
                if (otherSeats.indexOf(s.SeatName) >= 0) {
                    otherTrainsSeatsArr[idx].selected = true
                } else {
                    otherTrainsSeatsArr[idx].selected = false
                }
                if (chosenSeatList.indexOf(s.SeatName) >= 0) {
                    otherTrainsSeatsArr[idx].disabled = true
                } else {
                    otherTrainsSeatsArr[idx].disabled = false
                }
            })

            this.setData({
                otherTrainsSeatsArr,
                showType: 'seat',
            })
        },
        selectSeat(e) {
            const idx = e.currentTarget.dataset.index
            const seats = this.data.otherTrainsSeatsArr
            const seat = seats[idx]

            if (seat.SeatName == this.data.disabledSeat || this.data.disabledSeats.indexOf(seat.SeatName) > -1) return
            seat.selected = !seat.selected

            this.setData({
                otherTrainsSeatsArr: seats,
            })
        },
        confirmChooseSeat(options = {}) {
            const {
                hideBackDrop = true,
            } = options
            const seats = this.data.otherTrainsSeatsArr
            const otherSeats = []
            seats.forEach(s => {
                if (s.selected) {
                    otherSeats.push(s.SeatName)
                }
            })
            this.setData({
                otherSeats,
                otherSeatStr: otherSeats.join(','),
                isAcceptNoSeat:otherSeats.includes('无座'),
            })
            this.resetPrice && this.resetPrice()
            if (hideBackDrop) {
                this.hideBackDrop && this.hideBackDrop()
            }
        },
        cancelChooseSeat() {
            // 不需要重置备选座席，因为每次打开都会重置
            this.hideBackDrop && this.hideBackDrop()
        },
        getOtherTrainsSeats(otherTrains, train) {
            const updateOtherTrainSeats = (otherTrainsSeats, seat) => {
                if (!otherTrainsSeats[seat.SeatName]) {
                    otherTrainsSeats[seat.SeatName] = {
                        SeatPrice: parseFloat(seat.SeatPrice),
                    }
                } else if (parseFloat(seat.SeatPrice) > otherTrainsSeats[seat.SeatName].SeatPrice) {
                    otherTrainsSeats[seat.SeatName] = {
                        SeatPrice: parseFloat(seat.SeatPrice),
                    }
                }
            }
            let allTrain = train ? otherTrains.concat(train) : otherTrains
            let otherTrainsSeats = allTrain
                .map(item => item.SeatList)
                .reduce((otherTrainsSeats, SeatList) => {
                    SeatList?.forEach(seat => {
                        updateOtherTrainSeats(otherTrainsSeats, seat)
                    })

                    return otherTrainsSeats
                }, {})

            return otherTrainsSeats
        },
        /**
         *
         * @param {Array} otherSeats
         * @param {Object} otherTrainsSeats
         * @returns {{SeatName: String, SeatPrice: Number, selected: Boolean}[]} newOtherSeats
         */
        getOtherTrainsSeatsArr(otherSeats = [], otherTrainsSeats = {}) {
            otherSeats.forEach(SeatName => {
                if (otherTrainsSeats[SeatName]) {
                    otherTrainsSeats[SeatName].selected = true
                }
            })

            return Object.keys(otherTrainsSeats).map(key => ({
                SeatName: key,
                selected: false,
                ...otherTrainsSeats[key],
            }))
        },
    },
}
