$(document).ready(() => {
    class Web {

        deleteConfirm() {
            $('[data-delete]').on({
                click(e) {
                    e.preventDefault();
                    if (confirm('Do you want delete ?')) {
                        return fetch($(this).attr('href'), {
                            method: 'delete'
                        }).then((err, data) => {
                            console.log(err, '<<<<<');
                            if (err) {
                                return alert(err.statusText);
                            }
                            location.reload();
                        })
                    }
                }
            })
            return this;
        }

        init() {
            this.deleteConfirm()
        }
    }

    const app = new Web()
    app.init();
})