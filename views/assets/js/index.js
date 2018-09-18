$(document).ready(() => {
    class Web {

        deleteConfirm() {
            $('[data-delete]').on({
                click(e) {
                    e.preventDefault();
                    if (confirm('Do you want delete ?')) {
                        return fetch($(this).attr('href'), {
                            method: 'delete'
                        })
                            .then((res, body) => {
                                if (res.headers.get('Location')) {
                                    location.href = res.headers.get('Location');
                                }
                                if (res.status > 200) {
                                    return alert(res.statusText);
                                }
                                location.reload()
                            }).catch(console.error)
                    }
                }
            })
            return this;
        }

        handlerError(res) {
            return new Promise((resolve, reject) => {
                if (res.headers.get('Location')) {
                    location.href = res.headers.get('Location');
                }
                if (res.status > 200) {
                    return alert(res.statusText);
                }

                return resolve(res)
            })
        }

        loader(elem) {
            const text = `<div class="loader" id="loader-7"></div>`;
            if ($(elem).find('#loader-7').length) {
                $(elem).find('#loader-7').remove();
                $(elem).html($.defaultText);
                return
            }
            $.defaultText = $(elem).html();
            $(elem).html(text);
        }

        sendNotifications() {
            const self = this;
            $('[data-send]').on({
                click(e) {
                    e.preventDefault();
                    const elem = this;
                    self.loader(elem);

                    fetch($(this).attr('href'), {
                        method: 'post',
                    })
                        .then(self.handlerError)
                        .then(() => {
                            self.loader(elem);
                        }).catch(console.error)
                }
            })
            return this;
        }

        allSelected() {
            let check = false;
            $('[all-select]').on({
                click(e) {
                    e.preventDefault();

                    $('#users-select').find('option').each((i, e) => {
                        if (check) {
                            e.selected = false;
                            return;
                        }
                        e.selected = true;
                    });
                    check = !check;
                }
            });
            return this;
        }

        init() {
            this.deleteConfirm()
                .allSelected()
                .sendNotifications();
        }
    }

    const app = new Web()
    app.init();
})