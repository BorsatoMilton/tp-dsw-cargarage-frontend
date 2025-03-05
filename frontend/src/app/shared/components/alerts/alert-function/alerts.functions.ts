import Swal from 'sweetalert2';

export function alertMethod(title: string, message: string, type: any) {
    Swal.fire({
        title: title,
        text: message,
        icon: type,
      })
}